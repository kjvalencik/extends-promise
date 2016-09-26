module.exports = {
	"root" : true,
	"extends" : [
		"eslint-config-airbnb-base",
		"eslint-config-airbnb-base/rules/strict"
	],
	parserOptions : {
		sourceType : "script"
	},
	"rules" : {
		"strict" : [2, "global"],
		"arrow-body-style" : [0],
		"prefer-rest-params" : [0],
		"quotes" : [2, "double"],
		"brace-style" : [2, "1tbs", { "allowSingleLine": false }],
		"comma-dangle" : [2, "never"],
		"curly" : [2, "all"],
		"indent" : [2, "tab", { "SwitchCase": 1, "VariableDeclarator": 1 }],
		"no-mixed-spaces-and-tabs" : [2, "smart-tabs"],
		"key-spacing" : [2, { "align": "colon", "beforeColon": true, "afterColon": true }],
		"no-multi-spaces" : [2, { "exceptions": { "VariableDeclarator": true, "Property": true } }],
		"import/no-extraneous-dependencies": [2, { "devDependencies" : true }],
		"prefer-spread": [0],
		"no-tabs": [0],
		"arrow-parens": [0],
		"no-plusplus": [0]
	}
};
