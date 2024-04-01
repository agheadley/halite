<script>


</script>


<pre>

{
    _id: ...,
    entries: [
      { x: false, y: 1 },
      { x: "hello", y: 100 },
      { x: "goodbye", y: 1000 }
    ]
  }
  The following code shows how to increment a value in the first array element that matches a query.
  
  The query matches elements in the entries array where the value of x is a string type. The update increases the y value by 33 in the first matching element.
  
  // Query for all elements in entries array where the value of x is a string
  const query = { "entries.x": { $type : "string" } };
  // On first matched element, increase value of y by 33
  const updateDocument = {
    $inc: { "entries.$.y": 33 }
  };
  // Execute the update operation
  const result = await myColl.updateOne(query, updateDocument);

</pre>