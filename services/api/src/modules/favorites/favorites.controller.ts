import { Controller, Get } from "@nestjs/common";
import { favoriteLocations } from "../../data/stockholm.stub";

@Controller("favorites")
export class FavoritesController {
  @Get()
  listFavorites() {
    return {
      items: favoriteLocations
    };
  }
}

