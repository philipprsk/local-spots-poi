import { Request, ResponseToolkit } from "@hapi/hapi";


export const aboutController = {
  index: {
    handler: function (request: Request, h: ResponseToolkit) {
      const viewData = {
        title: "About Local Spots",
      };
      return h.view("about-view", viewData);
    },
  },
};
