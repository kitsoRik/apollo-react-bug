const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLBoolean, GraphQLList, GraphQLSchema, GraphQLID, GraphQLFloat, GraphQLNonNull } = require("graphql");
const { getAllUsers, getUserById, getUserByProductId, saveUserById, getProductsIdsByUserId, getSavedProductsIdsByUserId } = require("../db/models/user");
const { getProductsByIds, getAllProducts, getProductById } = require("../db/models/product");
const { getFeedbacksByProductId, getFeedbacksByUserId, getFeedbacksByUserIdCount } = require("../db/models/feedback");

const { customError } = require("../helpers/errors");
const { getLocationsByNamePattern, getLocationById } = require("../db/models/city");


const UserType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
        id: { type: GraphQLID },
        verifyed: { type: GraphQLBoolean },
        fullName: { type: GraphQLString },
        email: { type: GraphQLString },
        iconName: { type: GraphQLString },
        saveproducts: {
            type: new GraphQLList(ProductType),
            args: {
                page: { type: GraphQLInt },
                limit: { type: GraphQLInt },
            },
            resolve: ({ savedProducts }, { page, limit }, { user }) => {
                return getProductsByIds(savedProducts);
            }
        },
        products: {
            type: new GraphQLList(ProductType),
            args: {
                page: { type: GraphQLInt },
                limit: { type: GraphQLInt }
            },
            resolve: async ({ productsIds }, { page, limit }, { user }) => {
                return getProductsByIds(productsIds).skip((page - 1) * limit).limit(limit);
            }
        },
        productsCount: {
            type: GraphQLInt,
            resolve: ({ productsIds }) => {
                return getProductsByIds(productsIds).countDocuments();
            }
        },
        feedbacks: {
            type: new GraphQLList(FeedbackType),
            args: {
                page: { type: GraphQLInt },
                limit: { type: GraphQLInt }
            },
            resolve: async ({ id }, { page, limit }) => {
                return getFeedbacksByUserId(id, page, limit);
            }
        },
        feedbacksCount: {
            type: GraphQLInt,
            resolve: async ({ id }) => {
                return await getFeedbacksByUserIdCount(id);
            }
        },
        sales: {
            type: new GraphQLList(SaleType),
            args: {
                page: { type: new GraphQLNonNull(GraphQLInt) },
                limit: { type: new GraphQLNonNull(GraphQLInt) }
            },
            resolve: ({ id }, { page, limit }) => {
                return [];
            }
        },
        salesCount: {
            type: GraphQLInt,
            resolve: ({ id }) => {
                return 0;
            }
        }
    })
})

const ProductType = new GraphQLObjectType({
    name: "Product",
    fields: () => ({
        id: { type: GraphQLID },
        owner: {
            type: UserType,
            resolve: async ({ id }) => {
                return await getUserByProductId(id);
            }
        },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        price: { type: GraphQLFloat },
        category: { type: GraphQLString },
        location: {
            type: LocationType,
            resolve: async ({ locationId }) => {
                return await getLocationById(locationId);
            }
        },
        imageName: { type: GraphQLString },
        createdAt: { type: GraphQLInt },
        updatedAt: { type: GraphQLInt },
        saved: {
            type: GraphQLBoolean,
            resolve: async ({ id }, args, { user }) => {
                const userSavedProductsIds = await getSavedProductsIdsByUserId(user.id);
                return userSavedProductsIds.indexOf(id) !== -1;
            }
        },
        feedbacks: {
            type: new GraphQLList(FeedbackType),
            resolve: ({ id }) => {
                return getFeedbacksByProductId(id);
            }
        }
    })
});

const FeedbackType = new GraphQLObjectType({
    name: "Feedback",
    fields: () => ({
        id: { type: GraphQLID },
        user: {
            type: UserType,
            resolve: ({ userId }) => {
                return getUserById(userId);
            }
        },
        product: {
            type: ProductType,
            resolve: (source) => {
                console.log(source);
            }
        },
        rate: { type: GraphQLString },
        text: { type: GraphQLString },
        createdAt: { type: GraphQLString },
    })
});

const SaleType = new GraphQLObjectType({
    name: "sale",
    fields: () => ({
        id: { type: GraphQLID },
        user: {
            type: UserType,
            resolve: ({ userId }) => {
                return getUserById(userId);
            }
        },
        product: {
            type: ProductType,
            resolve: async ({ productId }) => {
                return await getProductById(productId);
            }
        },
        date: { type: GraphQLString }
    })
})

const LocationType = new GraphQLObjectType({
    name: "City",
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        longitude: { type: GraphQLFloat },
        latitude: { type: GraphQLFloat }
    })
});

const Query = new GraphQLObjectType({
    fields: () => ({
        savedProducts: {
            type: new GraphQLList(ProductType),
            args: {
                page: { type: GraphQLInt },
                limit: { type: GraphQLInt },
            },
            resolve: async (source, { title = "", location, locationId, category = 'any', priceFrom = -1, priceTo = -1, page = 1, limit }, { req, user }, info) => {
                const savedIds = await getSavedProductsIdsByUserId(user.id);
                return getProductsByIds(savedIds).skip((page - 1) * limit).limit(limit);
            }
        },
        savedProductsCount: {
            type: GraphQLInt,
            resolve: async (source, { title = "", location, locationId, category = 'any', priceFrom = -1, priceTo = -1, page = 1, limit }, { req, user }, info) => {
                const savedIds = await getSavedProductsIdsByUserId(user.id);
                return getProductsByIds(savedIds).countDocuments();
            }
        },
        products: {
            type: new GraphQLList(ProductType),
            args: {
                title: { type: GraphQLString },
                location: { type: GraphQLString },
                locationId: { type: GraphQLInt },
                category: { type: GraphQLString },
                priceFrom: { type: GraphQLFloat },
                priceTo: { type: GraphQLFloat },
                page: { type: GraphQLInt },
                limit: { type: GraphQLInt },
            },
            resolve: async (source, { title = "", location, locationId = -1, category = 'any', priceFrom = -1, priceTo = -1, page = 1, limit }, { req, user }, info) => {
                console.log(await getAllProducts(title, category, +locationId, priceFrom, priceTo).skip((page - 1) * limit).limit(limit));
                return getAllProducts(title, category, +locationId, priceFrom, priceTo).skip((page - 1) * limit).limit(limit);
            }
        },
        productsCount: {
            type: GraphQLInt,
            args: {
                title: { type: GraphQLString },
                location: { type: GraphQLString },
                locationId: { type: GraphQLInt },
                category: { type: GraphQLString },
                priceFrom: { type: GraphQLFloat },
                priceTo: { type: GraphQLFloat },
                page: { type: GraphQLInt },
                limit: { type: GraphQLInt },
            },
            resolve: (source, { title = "", location, locationId = -1, category = 'any', priceFrom = -1, priceTo = -1, page = 1, limit }, { req, user }, info) => {
                return getAllProducts(title, category, +locationId, priceFrom, priceTo).countDocuments();
            }
        },
        users: {
            type: new GraphQLList(UserType),
            args: {
                id: { type: GraphQLID },
                page: { type: GraphQLInt },
                limit: { type: GraphQLInt },
            },
            resolve: (source, { page, limit }, { req, user }) => {
                return getAllUsers({ page, limit });
            }
        },
        feedbacks: {
            type: new GraphQLList(FeedbackType),
            args: {
                userId: { type: GraphQLID },
                productId: { type: GraphQLID },
                page: { type: GraphQLInt },
                limit: { type: GraphQLInt }
            },
            resolve: (source, { userId, productId, page, limit }) => {
                return getFeedbacksByProductId(productId, page, limit);
            }
        },
        user: {
            type: UserType,
            args: {
                id: { type: GraphQLID },
            },
            resolve: (source, { id }, { req, user }) => {
                return getUserById(id);
            }
        },
        locations: {
            type: new GraphQLList(LocationType),
            args: {
                namePattern: { type: GraphQLString },
                page: { type: GraphQLInt },
                limit: { type: GraphQLInt }
            },
            resolve: async (source, { namePattern, page = 1, limit = 10 }) => {
                return await getLocationsByNamePattern(namePattern).skip((page - 1) * limit).limit(limit);
            }
        }
    }),
});

const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: () => ({
        changeSavedStateOfProduct: {
            type: GraphQLBoolean,
            args: {
                id: {
                    type: GraphQLID
                },
                state: {
                    type: GraphQLBoolean
                },
            },
            resolve: (source, { id, state }, { user }) => {
                if (!user) throw "WHAT";
                if (state && user.savedProducts.find(p => p === +id)) throw "WHAT1";

                if (!state && user.savedProducts.indexOf(+id) === -1) throw "WHAT2";


                if (state) user.savedProducts.push(+id);
                else user.savedProducts = user.savedProducts.filter(p => p !== +id);
                user.save();

                return state;
            }
        },
        saveUser: {
            type: UserType,
            args: {
                fullName: { type: GraphQLString },
                phone: { type: GraphQLString }
            },
            resolve: (source, { fullName, phone }, { user }) => {
                if (!user) {
                    throw customError("ACCESS_BLOCKED");
                }

                return saveUserById(user.id, fullName, phone);
            }
        }
    })
});

module.exports = new GraphQLSchema({
    query: Query,
    mutation: Mutation,
})