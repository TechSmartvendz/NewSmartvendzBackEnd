const { size, forEach } = require('lodash');

exports.saveData = (model, data) => {
    return model.create(data);
};

exports.updateData = (model, criteria, updateData, options = {}) => {
    options.new = true;
    return model.findOneAndUpdate(criteria, updateData, options);
};

exports.findDocuments = async (model, filter = {}, projection = null, options = {}) => {
    try {
      // Create a query using the provided filter
      const query = model.find(filter);
  
      // Apply the projection if provided
      if (projection) {
        query.select(projection);
      }
  
      // Apply additional options, such as sorting, pagination, etc.
      query.setOptions(options);
  
      // Execute the query and return the results
      const documents = await query.exec();
  
      return documents;
    } catch (error) {
      throw error;
    }
  };
  