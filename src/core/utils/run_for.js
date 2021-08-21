// const timeoutFn = (fn, timeout) => 
// {
//     return async (...args) => 
//     {
//         let timer = setTimeout(() => 
//         {
//             throw new Error('TIMEOUT');
//         }, timeout);
//         await fn(...args);
//         clearTimeout(timer);
//     }
// }

const run_for_fn = (fn, timeout) => 
{
    return async (...args) => 
	{
		let completed = false;
		try {
			await Promise.all([
				new Promise((resolve, reject) => {
					setInterval(() => {
						if (completed) {
							resolve();
						}
					}, 50); // check if completed every 50ms
					setTimeout(reject, timeout); // timeMS is max time to wait for func
				}),
				new Promise( async () => await fn(...args) )
				.then(() => { completed = true; })
			]);
		} catch (e) {
			console.log(e);
			// if funcAsync does not complete, you will get an exception here
			throw new Error(e);
		}
	}
}

module.exports = run_for_fn;