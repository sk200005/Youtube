
////////////Wrapper Function ///////////

// Catch errors that happen inside routes or endpooints ex -"/login" using async/await,
// and return a proper response instead of crashing the server.

const asyncHandler = (requestHandler) => {
    return async (req, res, next) => {       //actual automatic function that handles logic in a try–catch.
        try {
            await requestHandler(req, res, next);
        } catch (error) {
            res.status(error.code || 500).json({
                success: false,
                message: error.message,
            });
        }
    };
};
export { asyncHandler };

// const Handler = (reqHandle) => {
//   return (req, res, next) => {
//     Promise.resolve(reqHandle(req, res, next)).catch((err) => next(err));
//   };
// };
