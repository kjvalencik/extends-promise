module.exports = {
	"root"    : true,
	"extends" : "airbnb/legacy",
	"env"     : {
		"es6" : true
	},
	"rules"   : {
		"strict"                   : [2, "global"],
		"quotes"                   : [2, "double"],
		"brace-style"              : [2, "1tbs", { "allowSingleLine": false }],
		"comma-dangle"             : [2, "never"],
		"curly"                    : [2, "all"],
		"indent"                   : [2, "tab", { "SwitchCase": 1, "VariableDeclarator": 1 }],
		"no-mixed-spaces-and-tabs" : [2, "smart-tabs"],
		"key-spacing"              : [2, { "align": "colon", "beforeColon": true, "afterColon": true }],
		"no-multi-spaces"          : [2, { "exceptions": { "VariableDeclarator": true, "Property": true } }]
	}
};
