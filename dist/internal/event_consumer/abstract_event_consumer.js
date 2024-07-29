"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractEventConsumer = void 0;
const synchronous_consumer_js_1 = require("../kafka/consumer/synchronous_consumer.js");
const event_consumer_error_js_1 = require("../errors/event_consumer_error.js");
const logger_js_1 = require("../logger/logger.js");
/**
 * This class will start consuming the events and has functions to call what to do with the data for each event.
 */
class AbstractEventConsumer extends synchronous_consumer_js_1.SynchronousConsumer {
    /**
     * Public execute function has no parameters. this function will start consuming the events and will call
     * the callback function when an event is consumed. only need to call this event when you want to start
     * consuming the event.
     *
     * @returns {Promise<void>}
     */
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.start({
                next: (event) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield this.onEvent(event);
                    }
                    catch (error) {
                        throw event_consumer_error_js_1.EventConsumerError.createUnknown(error);
                    }
                }),
                error: (err) => {
                    logger_js_1.Logger.error(err);
                },
                closed: () => {
                    logger_js_1.Logger.info(`Consumer stopped for topics ${this.topics}`);
                },
            });
        });
    }
}
exports.AbstractEventConsumer = AbstractEventConsumer;
//# sourceMappingURL=abstract_event_consumer.js.map