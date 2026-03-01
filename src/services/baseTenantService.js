const { Model } = require("mongoose");

const findAll = async (Model, user, extraFilters = {})=>{
    return await Model.find({
        clinicId: user.clinicId,
        isDeleted: false,
        ...extraFilters
    });
};

const create = async (Model, data, user)=>{
    return await Model.create({
        ...data,
        clinicId: user.clinicId
    });
};

const findOne = async (Model, id, user)=>{
    return await Model.findOne({
        _id: id,
        clinicId: user.clinicId,
        isDeleted: false
    });
};

const softDelete=async(Model,id,user)=>{
    return await Model.findOneAndUpdate(
        {
            _id:id,
            clinicId:user.clinicId,
            isDeleted:false
        },
        {
            isDeleted:true
        },
        {
            new:true
        }
    )
}

module.exports = {
    findAll,
    create,
    findOne,
    softDelete
};