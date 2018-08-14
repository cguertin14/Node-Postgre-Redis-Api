import { Request, Response } from 'express';
import { User } from '../models/User';
import paginate from 'paginate-array';

/**
 * BaseController class.
 */
export default class BaseController {
    /**
     * BaseController constructor.
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    constructor(req, res) {
        this.req = req;
        this.res = res;
        this.user = req.user;
        this.__ = this.res.__;
        this.checkBody = this.req.checkBody;

        this._init();
    }

    _init() { }
    
    /**
     * 
     * @param {Array} data 
     * @param {Number} page 
     * @param {Number} perPage 
     */
    paginate(data, page, perPage) {
        return paginate(data, page, perPage);
    }
}