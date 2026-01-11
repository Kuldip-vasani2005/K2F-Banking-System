const schemas = require("./schemas");

function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false, 
      stripUnknown: true,
      errors: {
        wrap: {
          label: ''
        }
      }
    });
    
    if (error) {
      // Custom error messages
      const errors = error.details.map(detail => {
        // Format the error message
        const message = detail.message.replace(/"/g, '');
        
        // Special handling for specific fields
        const path = detail.path.join('.');
        
        // Make error messages more user-friendly
        switch(path) {
          case 'accountType':
            return "Account type must be either 'saving' or 'current'";
          case 'annualIncome':
            return "Please select a valid annual income range";
          case 'mobile':
          case 'emergencyContactPhone':
            return "Please enter a valid 10-digit mobile number";
          case 'pincode':
            return "Please enter a valid 6-digit pincode";
          case 'panNumber':
            return "Please enter a valid PAN number (format: ABCDE1234F)";
          case 'aadhaarNumber':
            return "Please enter a valid 12-digit Aadhaar number";
          default:
            return `${message.charAt(0).toUpperCase() + message.slice(1)}`;
        }
      });
      
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors
      });
    }
    
    req.body = value;
    next();
  };
}

module.exports = {
  validateBody,
  schemas
};