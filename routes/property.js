const Joi = require("joi");
const appHelper = require("../src/helpers");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const inMemory = require('cache-manager');


let memoryCache = null;

async function initializeCache() {
  if (memoryCache !== null) {
    return;
  }
  
  memoryCache = await inMemory.caching('memory', {
    max: 100,
    ttl: 10 * 1000 /*milliseconds*/,
  });  
}

async function getPropertyDetails(propertyId) {
  return await appHelper.GeneralErrorHandlerFn(async () => {    
    await initializeCache();    
    const cachedResult = await memoryCache.get(propertyId);
    if (cachedResult !== undefined) {
      console.log(`Using cached result for id ${propertyId}`);
      return cachedResult;
    }        
    const response = await appHelper.GetNoAuth(`${appHelper.EvolveBaseUrl}/${propertyId}`);
    const htmlDoc = new JSDOM(response.text);
    const dataElement = htmlDoc.window.document.getElementById("__NEXT_DATA__");
    const jsonData = JSON.parse(dataElement.text);
    await memoryCache.set(propertyId, jsonData);
    return jsonData;
  });
}

module.exports = [
  {
    method: "GET",
    path: "/property/reviews",
    options: {
      description: "Find reviews for property",
      notes: "Finds reviews",
      tags: ["api", "Property"],
      validate: {
        query: Joi.object({
          id: Joi.number()
            .required()
            .default(appHelper.DefaultPropertyId)
            .description("Property Id"),
        }),
      },
    },
    handler: async (request, h) => {
      const details = await getPropertyDetails(request.query.id);
      return details.props.pageProps.listingReviews;
    },
  },
  {
    method: "GET",
    path: "/property/listing",
    options: {
      description: "Find listing details for property",
      notes: "Finds listing",
      tags: ["api", "Property"],
      validate: {
        query: Joi.object({
          id: Joi.number()
            .required()
            .default(appHelper.DefaultPropertyId)
            .description("Property Id"),
        }),
      },
    },
    handler: async (request, h) => {
      const details = await getPropertyDetails(request.query.id);
      return details.props.pageProps.listing;
    },
  },  
];
