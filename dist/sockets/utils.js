"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerUtilsHandlers;
const languages_1 = __importDefault(require("../languages"));
const wordsBank_1 = require("../wordsBank");
function registerUtilsHandlers(io, socket) {
    const fetchLanguageOptions = () => {
        socket.emit("listen-fetch-language-options", {
            success: true,
            message: "Language options fetched successfully",
            data: {
                languages: languages_1.default,
            },
        });
    };
    const fetchCategoriesOptionsEn = () => {
        const categories = Object.values((0, wordsBank_1.returnWordsBank)("en")).map(category => { return { id: category.id, label: category.label }; });
        socket.emit("listen-fetch-categories-options-en", {
            success: true,
            message: "Words categories fetched successfully",
            data: {
                categories: categories,
            },
        });
    };
    const fetchCategoriesOptionsInd = () => {
        const categories = Object.values((0, wordsBank_1.returnWordsBank)("id")).map(category => { return { id: category.id, label: category.label }; });
        socket.emit("listen-fetch-categories-options-id", {
            success: true,
            message: "Words categories fetched successfully",
            data: {
                categories: categories,
            },
        });
    };
    socket.on("utils:language-options", fetchLanguageOptions);
    socket.on("utils:categories-options-en", fetchCategoriesOptionsEn);
    socket.on("utils:categories-options-id", fetchCategoriesOptionsInd);
}
//# sourceMappingURL=utils.js.map