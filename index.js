const {GraphQLSchema, GraphQLObjectType} = require('graphql');

const processedMarkDefault = Symbol();

const isProcessed = (decorator, target, mark = processedMarkDefault) => (target[mark] instanceof Set) && target[mark].has(decorator);

const setProcessedMark = (decorator, target, mark = processedMarkDefault) => target[mark] instanceof Set ? target[mark].add(decorator) : target[mark] = new Set([decorator]);

function decorate(decorator, target, parent) {
	if (typeof decorator === 'function') {
		decorator.call(this, target, parent);
	} else {
		throw new Error('Invalid decorator:' + decorator);
	}
}

module.exports.decorate = decorate;

function decorateSchema(decorator, target, parent, processedMark) {
	if (isProcessed(decorator, target, processedMark)) {
	} else {
		Object.values(target.getTypeMap())
			.map((value) => decorateType.call(this, decorator, value, target, processedMark));

		decorate.call(this, decorator, target, parent);
		setProcessedMark(decorator, target, processedMark);
	}
}

module.exports.decorateSchema = decorateSchema;

function decorateType(decorator, target, parent, processedMark) {
	if (isProcessed(decorator, target, processedMark)) {
	} else {
		if (typeof target.getFields === 'function') {
			Object.values(target.getFields())
				.map((value) => decorateField.call(this, decorator, value, target, processedMark));
		}
		decorate.call(this, decorator, target, parent);
		setProcessedMark(decorator, target, processedMark);
	}
}

module.exports.decorateType = decorateType;

function decorateField(decorator, target, parent, processedMark) {
	if (isProcessed(decorator, target, processedMark)) {
	} else {
		decorate.call(this, decorator, target, parent);
		setProcessedMark(decorator, target, processedMark);
	}
}

module.exports.decorateField = decorateField;

// decorate graphql schemas, types or individual fields
module.exports.default = function (decorator, target) {
	if (target instanceof GraphQLSchema) {
		return decorateSchema.apply(this, arguments);
	} else if (target instanceof GraphQLObjectType) {
		return decorateType.apply(this, arguments);
	} else {
		return decorateField.apply(this, arguments);
	}
};
