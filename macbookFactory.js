/* Default macbook model has 4GB of RAM and hard hard disc memory. Write a function
 * that takes note of a new customer order and has the flexibility to change 
 * RAM and memory configuration.
*/

function newOrder(){
	
	var order = {
		model : 'macbook',
		ram : 4,
		memory : 'hard disk'
	};

	var a = arguments;
	
	for (i = 1; i < a.length; i++){
		
		if(typeof a[i] == "object"){
			order = a[i];
			break;
		} else if(typeof a[i] == "number"){
			order.ram = a[i];
			break;
		} else if(a[i] == 'flash' ){
			order.memory = a[i];
			break;
		} else { throw new Error ('bad mackook input param')};
	}

	console.log(a[0] + " bought a " + JSON.stringify(order));
}

newOrder('luis', {
	model : 'macbook',
	ram : 16,
	memory : 'flash'	
});

