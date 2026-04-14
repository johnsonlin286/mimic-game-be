import { Server, Socket } from "socket.io";

import languageOptions from "../languages";
import { wordsBankEn, wordsBankId } from "../wordsBank";

export default function registerUtilsHandlers(io: Server, socket: Socket) {
  const fetchLanguageOptions = () => {
    socket.emit("listen-fetch-language-options", {
      success: true,
      message: "Language options fetched successfully",
      data: {
        languages: languageOptions,
      },
    })
  };

  const fetchCategoriesOptionsEn = () => {
    const categories = Object.values(wordsBankEn).map(category => category.label);
    socket.emit("listen-fetch-categories-options-en", {
      success: true,
      message: "Words categories fetched successfully",
      data: {
        categories: categories,
      },
    })
  }

  const fetchCategoriesOptionsInd = () => {
    const categories = Object.values(wordsBankId).map(category => category.label);
    socket.emit("listen-fetch-categories-options-id", {
      success: true,
      message: "Words categories fetched successfully",
      data: {
        categories: categories,
      },
    })
  }

  socket.on("utils:language-options", fetchLanguageOptions);
  socket.on("utils:categories-options-en", fetchCategoriesOptionsEn);
  socket.on("utils:categories-options-id", fetchCategoriesOptionsInd);
}
