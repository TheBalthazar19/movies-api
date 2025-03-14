"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const movies_1 = __importDefault(require("./routes/movies"));
const app = new hono_1.Hono();
app.route('/movies', movies_1.default);
exports.default = app;
