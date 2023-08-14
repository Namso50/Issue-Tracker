'use strict';

const { ObjectId } = require('mongodb');

module.exports = function (app, DB) {

  app.route('/api/issues/:project')

    .get(async (req, res) => {
      let project = req.params.project;
      // id converted with ObjectId
      if (req.query._id) {
        req.query._id = new ObjectId(req.query._id)
      }

      let issues = await DB.find({ ...req.query, project: project }).project({ project: 0 }) // return cursor

      res.json(await issues.toArray())
    })

    .post(async (req, res) => {
      let project = req.params.project;

      if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
        res.json({ error: 'required field(s) missing' })
        return
      }

      let result = {
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || "",
        status_text: req.body.status_text || "",
        created_on: new Date,
        updated_on: new Date,
        open: true
      };

      // add project name to find in which poject the issue is 
      let { insertedId } = await DB.insertOne({ ...result, project: project })
      let issue = await DB.find({ _id: insertedId }).project({ project: 0 })
      res.json((await issue.toArray())[0])
    })

    .put(async (req, res) => {
      let project = req.params.project;
      let { _id: id, ...updates } = req.body
      let updatedFields = { updated_on: new Date }

      if (!id) {
        res.json({ error: 'missing _id' })
        return
      } else if (!Object.keys(updates).length) {
        res.json({ error: 'no update field(s) sent', _id: id })
        return
      }

      for (const prop in req.body) {
        if (req.body[prop] && prop != '_id') {
          updatedFields[prop] = req.body[prop]
        }
      }

      try {
        let documentToUpdate = { _id: new ObjectId(id) }
        let result = await DB.updateOne(documentToUpdate, { $set: updatedFields })

        if (result.matchedCount && result.modifiedCount) {
          res.json({ result: 'successfully updated', _id: id })
          return
        }
        throw "false id"
      } catch (err) {
        res.json({ error: 'could not update', '_id': id })
      }
    })

    .delete(async (req, res) => {
      let project = req.params.project;
      let id = req.body._id

      if (!id) {
        res.json({ error: 'missing _id' })
        return
      }

      try {
        let documentToDelete = { _id: new ObjectId(id) }
        let result = await DB.deleteOne(documentToDelete)
        if (result.deletedCount) {
          res.json({ result: 'successfully deleted', _id: id })
          return
        }
        throw "not deleted"
      } catch (err) {
        res.json({ error: 'could not delete', '_id': id })
      }
    });

};
