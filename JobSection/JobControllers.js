

//  add a blog

const JobSchema = require("./JobSchema");

exports.createJobs= async (req, res) => {
  try {
    const blog = new JobSchema(req.body);
    await blog.save();
    console.log(blog);
    res.status(201).json({
      success: true,
      message: "Job listing created successfully!",
      blog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create job listing",
      error: error.message,
    });
  }
};

//    get all blogs
exports.getJobsByFlitterSearch = async (req, res) => {
  const {jobTitle, location, salaryRange, employmentType, remoteOption, search, page = 1, limit = 10 } = req.query;
    // Build filter object for MongoDB query
  const filter = {};
  if (jobTitle) filter.jobTitle = new RegExp(jobTitle, 'i');
  if (location) filter.location = new RegExp(location, 'i');
  if (employmentType) filter.employmentType = new RegExp(employmentType, 'i');
  if (remoteOption) filter.remoteOption = new RegExp(remoteOption, 'i');


  // Handle salary range filtering
  if (salaryRange) {
    const [minSalary, maxSalary] = salaryRange.split('-').map(Number);
    if (!isNaN(minSalary) && !isNaN(maxSalary)) {
        filter.salaryRange = { $gte: minSalary, $lte: maxSalary }; // Ensure you're using the right field
    }
}

// Search across multiple fields
if (search) {
  filter.$or = [
      { jobTitle: new RegExp(search, 'i') },
      { location: new RegExp(search, 'i') },
      { employmentType: new RegExp(search, 'i') },
      { remoteOption: new RegExp(search, 'i') },
      { 'responsibilities': { $in: [new RegExp(search, 'i')] } },
      { 'requirements': { $in: [new RegExp(search, 'i')] } },
      { 'skills': { $in: [new RegExp(search, 'i')] } }
  ];
}
  try {
    const jobs= await JobSchema.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
console.log(jobs);
    const count = await JobSchema.countDocuments(filter);

    res.status(200).json({
      success: true,
      jobs,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve job listings",
      error: error.message,
    });
  }
};

//  get all the blog  by id
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await JobSchema.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Job listing not found",
      });
    }
    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve job listing",
      error: error.message,
    });
  }
};
//  update a blog
exports.updateJobs = async (req, res) => {
  try {
    const blog = await JobSchema.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Job listing not found",
      });
    }
    res.status(200).json({
      message: "Job listing updated successfully!",
      blog,
    });
    console.log(blog);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update job listing",
      error: error.message,
    });
  }
};
//  delete a blog
exports.deleteJobs = async (req, res) => {
  try {
    const blog = await JobSchema.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Job listing not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Job listing deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete job listing",
      error: error.message,
    });
  }
};