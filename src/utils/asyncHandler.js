
////////////Wrapper Function ///////////

//standardise how each time when a [route handles function] or a finction is passed
//it give a same standard output to the user and reduces the writing of same code
// again and again

const asyncHandler = (requestHandler) => {
    return async (req, res, next) => {
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

// export { asyncHandler };

// const Handler = (reqHandle) => {
//   return (req, res, next) => {
//     Promise.resolve(reqHandle(req, res, next)).catch((err) => next(err));
//   };
// };
