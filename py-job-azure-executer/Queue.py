class Queue:
    def __init__(self):
        self.items = []

    def empty(self):
        return self.items == []

    def put(self, item):
        self.items.insert(0, item)

    def get(self):
        return self.items.pop()

    def size(self):
        return len(self.items)

    def get_item_by_id(self, task_id):
        for i in self.items:
            if i.id == task_id:
                return i
        return None
