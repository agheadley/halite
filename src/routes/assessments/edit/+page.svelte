<script>

import {cohorts,groups,location,alert,config, pupils} from '$lib/store';
import { onMount } from 'svelte';
import * as util from '$lib/util';
import { goto } from '$app/navigation';

export let data;

</script>


<div class="row">
    <div class="col">
        <h4>
            <span class="tag">
                {$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sl}
                ({$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sc})
                {$cohorts.assessments.years.list[$cohorts.assessments.years.index].lv}
                {$cohorts.assessments.years.list[$cohorts.assessments.years.index].yr}
                
            </span>
        </h4>
    </div>
    <div class="col">
        <a href={'/assessments'} class="button outline">Close</a>
    </div>
</div>

<div class="row">
    <div class="col">
        <h4>{data.assessment.n} {data.assessment.ds}</h4>
    </div>
    <div class="col">
        <button class="button dark">Manage</button>
    </div>
</div>

<h4>Edit each pupil entry ...</h4>
<p>filter : "pupils.pid":1111</p>


<p>{JSON.stringify(data.assessment)}</p>
<!--


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

-->