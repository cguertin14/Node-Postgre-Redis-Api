import Table from 'cli-table';

export default class RoutesHelper {
    static print(baseUrl, routes) {
        let table = new Table({ head: ["", "Path"] });
        console.log('\nROUTES for ' + baseUrl);
    
        for (var key in routes) {
            if (routes.hasOwnProperty(key)) {
                var val = routes[key];
                if(val.route) {
                    val = val.route;
                    var _o = {};
                    _o[val.stack[0].method.toUpperCase()]  = [baseUrl + val.path];    
                    table.push(_o);
                }       
            }
        }
    
        console.log(table.toString());
        return table;
    }
};