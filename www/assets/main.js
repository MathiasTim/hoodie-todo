$(function(){
    'use strict';

    window.hoodie = {};

    window.noteIt = {

        init: function(){
            hoodie = new Hoodie();

            this.eventListeners();

            if(hoodie.account.username){
                this.findAll();
            }

        },

        eventListeners: function(){
            var that = this;

            // when a new todo gets stored, add it to the UI
            hoodie.store.on('add:todo', this.addTodo);

            // when a new todo gets deleted, remove it from the UI
            hoodie.store.on('remove:todo', this.removeTodo);

            // clear todo list when the get wiped from store
            hoodie.account.on('signout', this.clearTodos);

            // show all Todos when user signs in
            hoodie.account.on('signin', this.findAll);

            // todo-state was updated
            hoodie.store.on('update:todo', this.changeTodoState);

            // handle creating a new task
            $('#todoinput').on('keypress', function(event) {
                if (event.keyCode == 13) { // ENTER
                    hoodie.store.add('todo', {title: event.target.value});
                    event.target.value = '';
                }
            });

            // handle removing a task
            $('body').on('click', '.item .delete', function(event) {
                var id = $(this).parent().data('id');
                hoodie.store.remove('todo', id);
            });

            // handle checking a todo item
            $('body').on('click', '.item[data-done="false"] input[type="checkbox"]', function(event) {
                var id = $(this).parent().data('id');
                hoodie.store.update('todo', id, {done : true});
            });
            // handle UNchecking a todo item
            $('body').on('click', '.item[data-done="true"] input[type="checkbox"]', function(event) {
                var id = $(this).parent().data('id');
                hoodie.store.update('todo', id, {done : false});
            });

            // switch to edit-mode
            $('body').on('click', 'button.edit', function(event) {
                var $this = $(this);
                if($this.attr('data-state') === 'edit'){
                    $this.attr('data-state', 'done');
                    $this.text('Done');
                } else {
                    $this.attr('data-state', 'edit');
                    $this.text('Edit');
                }
                $('li .delete').toggle();
            });
        },

        addTodo: function(todo){

            var checked =  todo.done ? ' checked="checked" ' : '';

            $('#todolist').prepend('<li class="item" data-id="' + todo.id + '" data-done="' + todo.done + '">' +
                '<input type="checkbox"' + checked + '>' +
                '<span>'+todo.title+'</span>' +
                '<span class="delete">&#10006;</span>' +
            '</li>');
        },

        changeTodoState: function(todo){
            if(todo.done){
                $('#todolist').children('[data-id=' + todo.id + ']').attr('data-done', 'true');
            } else {
                $('#todolist').children('[data-id=' + todo.id + ']').attr('data-done', 'false');
            }
        },

        removeTodo: function(todo){
            $('#todolist').children('[data-id=' + todo.id + ']').remove();
        },

        clearTodos: function(){
            $('#todolist').html('');
        },

        findAll: function(){
            var that = this;
            // initial load of all todo items from the store
            hoodie.store.findAll('todo').then( function(todos) {
                that.clearTodos();
                todos.sort(function(a, b) {
                    return a.createdAt > b.createdAt;
                });
                todos.forEach(that.addTodo);
            });
        }
    };

    noteIt.init();

});