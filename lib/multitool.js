const removeSlashFromString = (string) => {
	return string.replace(/\//g, "");
};

const convertObjectToArray = (obj) => {
	let tempArr = [];

	const arr =  Object.entries(obj);

	arr.forEach(element => {
		tempArr.push(element[1]);
	});

	return arr;
};
const convertObjectToArray2  = (NewObj)=>{
	let tempArr = [];
	const arr = Object.entries(NewObj);
	arr.forEach(element =>{
		tempArr.push(element[1])
	})
}


module.exports = {
	removeSlashFromString,
	convertObjectToArray,
	convertObjectToArray2,

};