const { size, forEach } = require('lodash');

exports.saveData = (model, data) => {
    return model.create(data);
};

exports.updateData = (model, criteria, updateData, options = {}) => {
    options.new = true;
    return model.findOneAndUpdate(criteria, updateData, options);
};

exports.getData = async (model, filter = {}, projection = null, options = {}) => {
    try {
      const query = model.find(filter);
      if (projection) {
        query.select(projection);
      }
      query.setOptions(options);
      const documents = await query.exec();
  
      return documents;
    } catch (error) {
      throw error;
    }
  };
  