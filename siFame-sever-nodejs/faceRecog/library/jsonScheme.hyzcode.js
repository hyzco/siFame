
const schemeObj = {
	title: "Distances with AI by HyzCode",	
	type:'object',
		properties:{
				distanceFromID:{
						type: 'integer',
				},
				distanceToID :{
						type :'integer',
				},
				distance:{
					type :'number',
				},
				description:{
					type :'string',
				},
				fame:{
					type: 'boolean',
				},	
	info:{
			type:'object',
				properties:{
					name:{
						type: 'string',
					},
					surname:{
						type: 'string',
					},
					age :{
						type: 'string',
					},
					ethnicity :{
						type : 'string',
					},
					nationality :{
						type :'string',
					},
					gender :{
						type :'string',
					}
				}
			}	
		}
}

const arrayScheme = {
	title : 'Array',
	type :'array',
	items: schemeObj
}

module.exports ={
    arrayScheme,
}