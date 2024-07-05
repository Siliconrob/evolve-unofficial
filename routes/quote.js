const Joi = require("joi");
const appHelper = require("../src/helpers");
const dateHelper = require("../src/datetools");

module.exports = [
  {
    method: "POST",
    path: "/quote/create",
    options: {
      description: "Create a quote",
      notes: "Creates a quote ",
      tags: ["api", "Quotes"],
      validate: {
        failAction: async (request, h, err) => {
          // During development, log and respond with the full error.
          console.log(err);
          throw err;
        },
        query: Joi.object({
          propertyId: Joi.number()
            .required()
            .default(appHelper.DefaultPropertyId)
            .description("Property Id"),
          start_date: Joi.date()
            .required()
            .iso()
            .default(
              dateHelper.dateOnly(dateHelper.addDays(new Date(Date.now()), 30))
            )
            .description("Arrival Date"),
          end_date: Joi.date()
            .required()
            .iso()
            .default(
              dateHelper.dateOnly(dateHelper.addDays(new Date(Date.now()), 32))
            )
            .description("Departure Date"),
        }),
        payload: Joi.object({
          adults: Joi.number()
            .required()
            .default(2)
            .description("Number of adults"),
          children: Joi.number()
            .required()
            .default(0)
            .description("Number of children"),
          pets: Joi.number()
            .required()
            .default(0)
            .description("Number of pets"),
        }),
      },
    },
    handler: async (request, h) => {
      const quoteDetails = {
        reservation: {
          internalListingID: request.query.propertyId.toString(),
          checkInDate: dateHelper.dateOnly(request.query.start_date),
          checkOutDate: dateHelper.dateOnly(request.query.end_date),
          numberOfAdults: request.payload.adults,
          numberOfChildren: request.payload.children,
          numberOfPets: request.payload.pets,
        },
        optionalLineItems: [],
        distributor: {
          listingChannel: "Website",
          clickId: "Default",
          deviceType: "Desktop",
          market: "en_us",
          sessionid: "",
          channel: "Website",
        },
      };
      return await appHelper.GeneralErrorHandlerFn(async () => {
        const response = await appHelper.Post(
          `${appHelper.EvolveBaseUrl}/api/quotes`,
          quoteDetails
        );
        return response.body;
      });
    },
  },
];
