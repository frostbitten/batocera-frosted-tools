module.exports = {
	outputName: "Simpsons",
	filters: [
		//first depth level acts as OR
		[ 
			{
				text: "simpsons",
				in: ["family"],
			},
		],
		[ 
			{
				text: "bart",
				in: ["name","path","desc"],
			},
			// {
				// text: "simpson",
				// in: ["name","path","desc"],
			// },
		],
		[
			{ 
				text: "The Simpsons",
				in: ["name","path","desc"],
			},
		],
		[
			//elements at this depth act as AND
			{
				text: "Itchy",
				in: ["name","path"],
			},
			{
				text: "Scratchy",
				in: ["name","path"],
			},
		],
		[
			{
				text: "krusty's",
				in: ["name","path","desc"],
			},
		],
	]
}