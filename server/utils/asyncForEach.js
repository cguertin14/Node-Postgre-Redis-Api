// Async foreach function 
// (IMPORTANT -> THIS FEATURE WILL BE IMPLEMENTED IN ES9)
export default async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
};