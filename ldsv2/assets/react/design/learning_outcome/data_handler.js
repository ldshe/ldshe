import uuidv4 from 'uuid/v4';
import uuidv5 from 'uuid/v5';

export default class DataHandler {

    importClone(data, ns, idMap) {
        return data.map(d => {
            let newId = uuidv5(`course.${ns.courseId}.${uuidv4()}`, ns.uuidv5Namespace.outcome);
            idMap[d.id] = newId;
            return Object.assign({}, d, {id: newId});
        });
    }
}
