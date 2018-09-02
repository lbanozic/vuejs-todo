var vm = new Vue({
    el: '#todo-container',
    data: {
        api: {
            get: 'http://localhost:8080/vuejs-todo-api/items/list',
            update: 'http://localhost:8080/vuejs-todo-api/items/update'
        },
        todoItems: [],
        newItemName: '',
        newItemNameValid: true,
        initialLoadInProgress: true
    },
    methods: {
        /**
         * Sorts todoItems array so that completed and non-completed items are separated, each sorted by time.
         */
        sortItems: function () {

            //specify custom compare function for sorting todoItems array
            this.todoItems.sort(function (a, b) {

                //if item "a" is non-completed, it comes first
                if (a.completed === false && b.completed === true) {
                    return -1;
                }
                //if item "b" is non-completed, it comes first
                else if (a.completed === true && b.completed === false) {
                    return 1;
                }
                //if items "a" and "b" are both completed or non-completed, sort them by time (newer items come first)
                else {
                    if (convertStringToDate(a.time) > convertStringToDate(b.time)) {
                        return -1;
                    } else {
                        return 1;
                    }
                }
            });
        },
        /**
         * Deletes todoItem by its id from todoItems array.
         */
        deleteItem: function (todoItemId) {

            //iterate through todoItems
            for (var i = 0; i < this.todoItems.length; i++) {

                //get todoItem
                var currentTodoItem = this.todoItems[i];

                //delete todoItem if its id matches todoItemId
                if (currentTodoItem.id === todoItemId) {
                    this.todoItems.splice(i, 1);
                }
            }
        },
        /**
         * Sets newItemNameValid flag to true if new item name is not empty or to false if it's empty.
         */
        validateNewItemName: function () {
            this.newItemNameValid = this.newItemName.length > 0;
        },
        /**
         * Sets all *valid flags to true.
         */
        removeErrors: function () {
            this.newItemNameValid = true;
        },
        /**
         * Gets item's last id from todoItems array. If last id is not greater than
         */
        getItemLastId: function () {
            var lastId = Math.max.apply(Math, this.todoItems.map(function (o) {
                return o.id
            }));
            return lastId > 0 ? lastId : 0;
        },
        /**
         * Adds new item to todoItems array.
         */
        addItem: function () {

            //set newItemNameValid flag (check if it is empty or not)
            this.validateNewItemName();

            //if newItemName is valid (not empty)
            if (this.newItemNameValid) {

                //add new item to todoItems array with current time and completed set to false
                this.todoItems.push({
                    id: this.getItemLastId() + 1,
                    name: this.newItemName,
                    time: getCurrentTime(),
                    completed: false
                });

                //clear new item name
                this.newItemName = '';

                //sort todoItems array
                this.sortItems();
            }
        },
        /**
         * Deletes item if item is empty.
         */
        deleteItemIfEmpty: function (item) {
            if (item.name.length <= 0) {
                this.deleteItem(item.id);
            }
        },
        /**
         * Send items to backend.
         */
        syncItems: function () {
            axios.post(this.api.update, vm.todoItems)
                .then(function (response) {
                    console.log("TODO items successfully synced with backend.");
                    console.log(response);
                })
                .catch(function (error) {
                    console.log("Error with backend syncing.");
                    console.log(error);
                });
        }
    },
    computed: {
        /**
         * Returns count of non-completed items in todoItems array.
         */
        activeItemsCount: function () {

            var activeCount = 0;

            //iterate through todoItems
            for (var i = 0; i < this.todoItems.length; i++) {

                //get todoItem
                var currentTodoItem = this.todoItems[i];

                //increase activeCount by 1 if item is non-completed
                if (currentTodoItem.completed === false) {
                    activeCount++;
                }
            }
            return activeCount;
        },
        /**
         * Returns count of completed items in todoItems array.
         */
        completedItemsCount: function () {

            var completedCount = 0;

            //iterate through todoItems
            for (var i = 0; i < this.todoItems.length; i++) {

                //get todoItem
                var currentTodoItem = this.todoItems[i];

                //increase completedCount by 1 if item is completed
                if (currentTodoItem.completed === true) {
                    completedCount++;
                }
            }
            return completedCount;
        }
    },
    watch: {
        /**
         * Send items to backend on every change on todoItems array, excluding initial items load.
         */
        todoItems: {
            handler: function () {
                if (!this.initialLoadInProgress) {
                    this.syncItems();
                } else {
                    this.initialLoadInProgress = false;
                }
            },
            deep: true
        }
    },
    /**
     * Load items and sort them before mounting begins.
     */
    beforeMount() {

        //load items from REST API
        axios.get(this.api.get)
            .then(function (response) {
                vm.todoItems = response.data;
                vm.sortItems();
            })
            .catch(function (error) {
                console.log(error);
            });
    }
});

/**
 * Converts date and time in "yyyy.MM.dd. HH:mm:ss" format to Date object.
 */
function convertStringToDate(dateTime) {

    //split date and time
    var date = dateTime.split(' ')[0];
    var time = dateTime.split(' ')[1];

    //split year, month and day from date
    var year = parseInt(date.split('.')[2]);
    var month = parseInt(date.split('.')[1]) - 1; //in JavaScript, months start from 0
    var day = parseInt(date.split('.')[0]);

    //split hours, minutes and seconds from time
    var hours = parseInt(time.split(':')[0]);
    var minutes = parseInt(time.split(':')[1]);
    var seconds = parseInt(time.split(':')[2]);

    //create new Date object and return it
    return new Date(year, month, day, hours, minutes, seconds);
}

/**
 * Returns current time in "yyyy.MM.dd. HH:mm:ss" format.
 */
function getCurrentTime() {

    //get current time
    var d = new Date();

    //get day, month, year, hours and minutes
    var day = d.getDate();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();
    var hours = d.getHours();
    var minutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
    var seconds = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds();

    //return current time in "yyyy.MM.dd. HH:mm:ss" format
    return day + '.' + month + '.' + year + '.' + ' ' + hours + ':' + minutes + ':' + seconds;

}