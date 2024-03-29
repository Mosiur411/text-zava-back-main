const { default: mongoose } = require('mongoose');
const { errorMessageFormatter } = require('../../utils/helpers');
const { DevelopmentModel } = require('../../model/product/development.model');
const { CategorieModel } = require('../../model/product/categories.model');
const { SubCategorieModel } = require('../../model/product/subcategories.model');

/* Development create */
const doesDepartmentExist = (id) => {
    try {
        const isDepartment = DevelopmentModel.findOne({ _id: id })
        return isDepartment
    } catch (err) {
        throw new Error(err.message)
    }
}
const addDevelopment = async (req, res) => {
    try {
        const data = { name: req.body?.name, user: req.user._id, images: req.body?.images }
        const development = await DevelopmentModel.create(data);
        return res.status(201).json({ development });
    } catch (err) {
        const errorMessage = errorMessageFormatter(err);
        return res.status(500).json(errorMessage);
    }
};

const getDevelopment = async (req, res) => {
    try {
        const development = await DevelopmentModel.find({}).sort({ _id: -1 }).populate('user', "name email");
        return res.status(201).json({ development });


    } catch (err) {
        const errorMessage = errorMessageFormatter(err);
        return res.status(500).json(errorMessage);
    }
};
const updateDepartment = async (req, res) => {
    const data = req.body;
    const { _id } = req.query;
    console.log(data)
    if (!_id) return res.status(400).json({ Message: 'product Not select ' });
    const department = await DevelopmentModel.findOneAndUpdate({ _id }, { ...data }, { new: true })
    return res.status(201).json({ department });
}

const deleteDevelopment = async (req, res) => {
    try {
        const { development_id } = req.query;
        const categoriesToDelete = await CategorieModel.aggregate([
            { $match: { development_id: new mongoose.Types.ObjectId(development_id) } },
            { $project: { _id: 1 } }
        ]);

        const subCategoriesToDelete = await SubCategorieModel.aggregate([
            { $match: { development_id: new mongoose.Types.ObjectId(development_id) } },
            { $project: { _id: 1 } }
        ]);

        const categoryIdsToDelete = categoriesToDelete.map((category) => category._id);
        const subCategoryIdsToDelete = subCategoriesToDelete.map((scategory) => scategory._id);
        if (categoriesToDelete.length !== 0) {
            await CategorieModel.deleteMany({ _id: { $in: categoryIdsToDelete } });
        }
        if (subCategoriesToDelete.length !== 0) {
            await SubCategorieModel.deleteMany({ _id: { $in: subCategoryIdsToDelete } });
        }
        await DevelopmentModel.findByIdAndDelete(development_id);
        return res.status(201).json({ result: 'su' });
    } catch (err) {
        const errorMessage = errorMessageFormatter(err);
        return res.status(500).json(errorMessage);
    }
};

module.exports = {
    addDevelopment,
    getDevelopment,
    deleteDevelopment,
    doesDepartmentExist,
    updateDepartment
};
