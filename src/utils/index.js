const _ = require('lodash');
const { Types } = require('mongoose');

const convertToObjectIMongodb = id => Types.ObjectId(id); 

const getInfoData = ({ fileds = [], object = {} }) => {
      return _.pick( object, fileds);
}
// Array -> Object
const getSelectData = (select = []) => {
      return Object.fromEntries(select.map(el => [el, 1]));
}

const unGetSelectData = (select = []) => {
      return Object.fromEntries(select.map(el => [el, 0]));
}

// remove null value
const removeUnderfineObject = obj => {
      Object.keys(obj).forEach(k => {
            if (obj[k] == null) {
                  delete obj[k];
            }
      });
      
      return obj;
}


const updateNestedObjectParser = obj => {
      console.log(`object 1 :>> `, obj);
      const final = {};
      Object.keys(obj).forEach(k => {
            if (typeof obj[k] === 'Object' && !Array.isArray(obj[k])) {
                  const response = updateNestedObjectParser(obj[k]);
                  Object.keys(response).forEach(a => {
                        final[`${k}.${a}`] = response[a]
                  });
            } else {
                  final[k] = obj[k]
            }
      });
      console.log(`object 2 :>> `, final);
      return final;
}

module.exports = {
      getInfoData,
      getSelectData,
      unGetSelectData,
      removeUnderfineObject,
      updateNestedObjectParser,
      convertToObjectIMongodb
}