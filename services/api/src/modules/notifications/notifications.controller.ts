import { Controller, Get } from "@nestjs/common";
import { prototypeAlerts } from "../../data/stockholm.stub";

@Controller("notifications")
export class NotificationsController {
  @Get("alerts")
  listAlerts() {
    return {
      items: prototypeAlerts
    };
  }
}

