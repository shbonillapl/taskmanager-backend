const Task = require('../models/Task');

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.addTask = async (req, res) => {
  const { title } = req.body;
  try {
    const newTask = new Task({ title, user: req.user.id });
    const task = await newTask.save();
    res.json(task);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.updateTask = async (req, res) => {
  const { title, completed } = req.body;
  try {
    let task = await Task.findById(req.params.id);
    if (!task || task.user.toString() !== req.user.id)
      return res.status(404).json({ msg: 'Task not found' });

    task.title = title ?? task.title;
    task.completed = completed ?? task.completed;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task || task.user.toString() !== req.user.id)
      return res.status(404).json({ msg: 'Task not found' });

    await task.remove();
    res.json({ msg: 'Task removed' });
  } catch (err) {
    res.status(500).send('Server error');
  }
};
