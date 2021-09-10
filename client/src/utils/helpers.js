export function pluralize(name, count) {
  if (count === 1) {
    return name
  }
  return name + 's'
}

export function idbPromise(storeName, method, object) {
  return new Promise((resolve, reject) => {
    //open a connection to the database with the version of 1?
    const request = window.indexedDB.open('shop-shop', 1);

    //create variables to hold reference to the database, transaction(tx), and object store
    let db, tx, store;

    //if version has changed (or if this is the first time using the db), run the method and created the three object stores 
    request.onupgradeneeded = function(e)
    {
      const db = request.result;
      //create an object store for each type of data and set "primary" key index to be the '_id' of the data 
      db.createObjectStore('products', {key_path: '_id'});
      db.createObjectStore('categories', {keyPath: '_id'});
      db.createObjectStore('cart', {keyPath: '_id'});
    };

    //handle errors when connecting 
    request.onerror = function(e)
    {
      console.log('There was an error. ')
    }

    //on database open on success 
    request.onsuccess = function(e)
    {
      db = request.result;
      tx = db.transaction(storeName, 'readwrite')
      //save a referance to the object store 
      store = tx.objectStore(storeName);

      //if there's any errors 
      db.onerror = function(e)
      {
        console.log(e);
      }

      switch(method) {
        case 'put':
          store.put(object);
          resolve(object);
          break;
        case 'get':
          const all = store.getAll();
          all.onsuccess = function() {
            resolve(all.result);
          }
          break;
        case 'delete':
          store.delete(object._id)
          break;
        default:
          console.log('No valid method')
          break;
      }

      //when the transaction is complete, close the connection
      tx.oncomplete = function()
      {
        db.close();
      }
    }
  })
}