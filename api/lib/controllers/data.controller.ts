import Controller from "../interfaces/controller.interface";
import { Request, Response, NextFunction, Router } from 'express';
import { checkIdParam } from "../middlewares/deviceIdParam.middleware";
import DataService from "../modules/services/data.service";
import path = require("path");

let testArr = [4,5,6,3,5,3,7,5,13,5,6,4,3,6,3,6];

class DataController implements Controller {
    public path = '/api/data';
    public router = Router();
    public dataService = new DataService;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/latest`, this.getLatestReadingsFromAllDevices);
        this.router.post(`${this.path}/:id`, checkIdParam, this.addData);
        this.router.get(`${this.path}/:id`, checkIdParam, this.getAllDeviceData);
        this.router.get(`${this.path}/:id/latest`, checkIdParam, this.getDataWithRange);
        this.router.get(`${this.path}/:id/:num`, checkIdParam, this.getDataWithRange);
        this.router.delete(`${this.path}/all`, this.deleteAll);
        this.router.delete(`${this.path}/:id`, checkIdParam, this.deleteData);
    }

    private getLatestReadingsFromAllDevices = async (request: Request, response: Response, next: NextFunction) => {
        const data = testArr;
        response.status(200).json(data);
     };

     private addData = async (request: Request, response: Response, next: NextFunction) => {
        const { temperature, pressure, humidity} = request.body;
        const { id } = request.params;
     
        const data = {
            temperature,
            pressure,
            humidity,
            deviceId: parseInt(id)  
        }   
       
        try {
            await this.dataService.createData(data);
            response.status(200).json(data);
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response.status(400).json({ error: 'Invalid input data.' });
        }
     };   

     private getAllDeviceData = async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;
        const allData = await this.dataService.query(id);
        response.status(200).json(allData);
    };

    /*private getLatest = async (request: Request, response: Response, next: NextFunction) => {
        const {id} = request.params;
        const data = testArr;
        const max = data.reduce((a, b) => Math.max(a, b), -Infinity);
        response.status(200).json(max);
    }*/

    private getDataWithRange = async (request: Request, response: Response, next: NextFunction) => {
        const {id} = request.params;
        const {num} = request.params;
        response.status(200).json(testArr.splice(Number(id), Number(num)));

        try {
            if (num) {
                const info = await this.dataService.query(id);
                const begin = Math.max(0, info.length - Number(num));
                const end = Math.min(info.length, begin + Number(num));
                const testArr = info.slice(begin - end);
                response.status(200).json(testArr);
            } else {
                const last = await this.dataService.get(id);
                response.status(200).json(last)
            }
        } catch (error) {
            console.error(`${error}`);
            response.status(500).json({error: 'Error'});
        }
    }

    private deleteAll = async (request: Request, response: Response, next: NextFunction) => {
        //testArr = [];
        try{
            await this.dataService.deleteData('all');
            response.status(200).json({message: 'Cleared'});
        } catch (error) {
            console.error(`${error.message}`);
            response.status(500).json({error: 'Error'});
        }
    }

    private deleteData = async (request: Request, response: Response, next: NextFunction) => {
        const {id} = request.params;
        //const elem = testArr[Number(id)-1];
        //testArr.splice(Number(id)-1, 1)
        //response.status(200).json(`Id: ${id}, Element: ${elem}`);

        try{
            await this.dataService.deleteData(id);
            response.status(200).json({message: 'Deleted!'})
        } catch (error) {
            console.error(`${error.message}`);
            response.status(500).json({error: 'Error'});
        }
    }
}

export default DataController;