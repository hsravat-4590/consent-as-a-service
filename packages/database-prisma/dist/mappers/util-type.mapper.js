"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertLocalDateTimeToDate = void 0;
const core_1 = require("@js-joda/core");
const convertLocalDateTimeToDate = (dateTime) => (0, core_1.convert)(dateTime).toDate();
exports.convertLocalDateTimeToDate = convertLocalDateTimeToDate;
