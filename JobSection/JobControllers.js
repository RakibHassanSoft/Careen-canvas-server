//  add a blog

const JobSchema = require("./JobSchema");

exports.createJobs = async (req, res) => {
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

// Get All
exports.getJobs = async (req, res) => {
  try {
    const jobs = await JobSchema.find(); // Use await to ensure you get the data before proceeding
    res.status(200).json({
      success: true,
      jobs: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve job listing",
      error: error.message,
    });
  }
};

exports.getJobsByFilterSearch = async (req, res) => {
  const { searchQuery } = req.query;
  const {
    jobTitle,
    location,
    salaryRange = [],
    employmentType,
    remoteOption, // This corresponds to JobType in frontend
    search = searchQuery,
    page = 1,
    limit = 10,
  } = req.query;

  console.log(req.query)

  // Build filter object for MongoDB query
  const filter = {};
  if (jobTitle) filter.jobTitle = new RegExp(jobTitle, "i");
  if (location) filter.location = new RegExp(location, "i");
  if (employmentType) filter.employmentType = { $in:employmentType };
  if (remoteOption) filter.remoteOption = { $in: remoteOption }; // Use array for multiple options
  if (salaryRange.length > 0) {
    filter.$or = salaryRange.map((range) => {
      const [minSalary, maxSalary] = range.split("-").map(Number);
      if (range.includes("5000+")) {
        return { salaryRange: { $gte: 5000 } }; // Handle the "5000+" case
      } else {
        return {
          salaryRange: {
            $gte: minSalary,
            ...(maxSalary && { $lte: maxSalary }), // Add max salary condition if available
          },
        };
      }
    });
  }
  // if (search) filter.$text = { $search: search };
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
  console.log(search)

  try {
    const jobs = await JobSchema.find(filter)
      .sort({ createdAt: -1 }) // Add sorting logic
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const totalJobs = await JobSchema.countDocuments(filter);
    const totalPages = Math.ceil(totalJobs / limit);

    res.status(200).json({ jobs, totalPages });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
