import BaseController from "../controllers/baseController";

/**
 * Master Validator Class.
 */
export default class Validator {
    /**
     * Validator constructor.
     * 
     * @param {BaseController} context 
     */
    constructor(context) {
        this.context = context;
        this.__ = context.__;
        this.checkBody = context.checkBody;
        this.req = context.req;
        this.validationErrors = this.req.validationErrors;
    }
}