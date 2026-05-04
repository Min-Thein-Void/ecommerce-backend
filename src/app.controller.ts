import { Controller, Get, Post } from "@nestjs/common";
import { AppService } from "./app.service.js";

@Controller()
export class AppController {
  constructor(
    private appService : AppService
  ) {}

  @Get()
  getHello(){
    return this.appService.getHello()
  }
}