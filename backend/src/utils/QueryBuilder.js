import CacheService from "../services/cacheService.js";

class QueryBuilder {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  search(searchableFields) {
    if (this.queryString.search) {
      const keyword = this.queryString.search;
      const searchConditions = searchableFields.map((field) => ({
        [field]: {
          $regex: keyword,
          $options: "i", // case-insensitive
        },
      }));
      this.query = this.query.find({ $or: searchConditions });
    }
    return this;
  }

  filter(excludeFields = []) {
    const queryObj = { ...this.queryString };
    // Fields to exclude from exact match filtering (handled separately)
    const excluded = ["page", "sort", "limit", "fields", "search", "sortBy", "order", "startDate", "endDate", ...excludeFields];
    excluded.forEach((el) => delete queryObj[el]);

    // Apply exact matches
    this.query = this.query.find(queryObj);

    // Apply date range filters if present (commonly used for appointments)
    if (this.queryString.startDate || this.queryString.endDate) {
      const dateQuery = {};
      if (this.queryString.startDate) dateQuery.$gte = this.queryString.startDate;
      if (this.queryString.endDate) dateQuery.$lte = this.queryString.endDate;
      
      // We assume the field is 'appointmentDate' for this platform, or 'createdAt' generally
      // Will default to 'appointmentDate' since it's the primary range filter required
      this.query = this.query.find({ appointmentDate: dateQuery });
    }

    return this;
  }

  sort(defaultSort = "-createdAt") {
    if (this.queryString.sortBy) {
      const sortBy = this.queryString.sortBy;
      const order = this.queryString.order === "desc" ? "-" : "";
      this.query = this.query.sort(`${order}${sortBy}`);
    } else {
      this.query = this.query.sort(defaultSort);
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    let limit = parseInt(this.queryString.limit, 10) || 10;
    
    if (limit > 100) limit = 100; // Cap at 100

    const skip = (page - 1) * limit;
    
    this.paginationContext = { page, limit, skip };
    this.query = this.query.skip(skip).limit(limit);
    
    return this;
  }

  async execute(cacheKey = null, ttlSeconds = 120) {
    if (cacheKey) {
      const cachedData = await CacheService.get(cacheKey);
      if (cachedData) return cachedData;
    }

    // Run countDocuments without skip/limit using the exact same filters
    const filterQuery = this.query.getQuery();
    
    // Execute data fetch and count concurrently for efficiency
    const [data, totalItems] = await Promise.all([
      this.query,
      this.query.model.countDocuments(filterQuery)
    ]);

    // Handle cases where paginate() wasn't called
    const page = this.paginationContext?.page || 1;
    const limit = this.paginationContext?.limit || (data.length > 0 ? data.length : 10);
    const totalPages = Math.ceil(totalItems / limit) || 1;

    const result = {
      data,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };

    if (cacheKey) {
      await CacheService.set(cacheKey, result, ttlSeconds);
    }

    return result;
  }
}

export default QueryBuilder;
