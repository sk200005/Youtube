const updateUserCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    if(!coverImageLocalPath) {throw new ApiError(400 , "CoverImage file is Missing")}

    const uploadcoverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!uploadcoverImage.url) {throw new ApiError(400 , "Error while uploading coverImage on Cloudinary")}
     
    const updatecoverImage = await User.findByIdAndUpdate(
        req.user._id,  //id through request(auth middleware)
        {$set : {coverImage : uploadcoverImage.url}},
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200 ,{} ,"Uplaoded CoverImage Successfully"))
})