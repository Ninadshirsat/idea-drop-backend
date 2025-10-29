import express from "express";
import Idea from "../models/Idea.js";
import mongoose from "mongoose";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route         GET /api/ideas
// @description   Get all ideas
//@access         Public
//@query          _limit (optinal limit for ideas returned)
router.get("/", async (req, res, next) => {
  try {
    const limit = parseInt(req.query._limit);
    const query = Idea.find().sort({ createdAt: -1 });

    if (!isNaN(limit)) {
      query.limit(limit);
    }

    const ideas = await query.exec();
    res.json(ideas);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// @route         GET /api/ideas/:id
// @description   Get single idea
//@access         Public
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("Idea Not Found");
    }

    const idea = await Idea.findById(id);
    if (!idea) {
      res.status(404);
      throw new Error("Idea Not Found");
    }
    res.json(idea);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// @route         POST /api/ideas
// @description   Create new ideas
//@access         Public
router.post("/", protect, async (req, res, next) => {
  try {
    const { title, summary, description, tags } = req.body || {};

    if (!title?.trim() || !summary?.trim() || !description?.trim()) {
      res.status(404);
      throw new Error("Title, Summary and Description are required");
    }

    const newIdea = new Idea({
      title,
      summary,
      description,
      tags:
        typeof tags === "string"
          ? tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : Array.isArray(tags)
          ? tags
          : [],
      user: req.user.id,
    });

    const savedIdea = await newIdea.save();
    res.status(201).json(savedIdea);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// @route         DELETE /api/ideas/:id
// @description   Delete one idea
//@access         Public
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("Idea Not Found");
    }

    const idea = await Idea.findById(id);

    if (!idea) {
      res.status(404);
      throw new Error("Idea Not Found");
    }

    //check if User Owns idea
    if (idea.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorised to delete this Idea");
    }

    await idea.deleteOne();

    res.json({ message: "Idea Deleted Successfully" });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

//@route         PUT /api/ideas/:id
//@description   update one idea
//@access         Public
router.put("/:id", protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("Idea Not Found");
    }

    const idea = await Idea.findById(id);

    if (!idea) {
      res.status(404);
      throw new Error("Idea Not Found");
    }

    //check if User Owns idea
    if (idea.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorised to update this Idea");
    }

    const { title, summary, description, tags } = req.body || {};

    if (!title?.trim() || !summary?.trim() || !description?.trim()) {
      res.status(404);
      throw new Error("Title, Summary and Description are required");
    }

    idea.title = title;
    idea.summary = summary;
    idea.description = description;
    idea.tags = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
      ? tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

    const updatedIdea = await idea.save();

    res.json(updatedIdea);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

export default router;
