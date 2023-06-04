import ko from "knockout"

interface IMenuItem {
    id: number,
    name: String,
    type_id: number,
    price: number,
    options?: number[],
}

interface IMenuType {
    id: number,
    name: String,
}

interface IMenu {
    items: IMenuItem[],
    types: IMenuType[],
}


interface IModalOptionViewModel {
    id: number,
    name: String,
    selected: ko.Observable<boolean>;
}

interface IModalViewModel {
    showModal: ko.Observable<boolean>;
    modalOptions: ko.ObservableArray<IModalOptionViewModel>;
    onComplete: ko.Observable<CallableFunction>;

    setModal(value: boolean): IModalViewModel;
    onCancel(): void;
    setOptions(options: number[]): IModalViewModel;
    setOnDone(fn: CallableFunction): IModalViewModel;
}


interface IRootViewModel {
    modalModel: ko.Observable<IModalViewModel>,
    shoppingCart: ko.ObservableArray<IShoppingCartItemModel>,
    types: ko.ObservableArray<IMenuTypeViewModel>,
    total(): number,
    totalSurcharge(): string,
}

interface IShoppingCartItemModel {
    name: String,
    options: number[],
    quantity: number,
    ondelete: CallableFunction,
    onedit: CallableFunction | null,
    price: ko.Computed;
    displayName: ko.Computed;
    displayPrice: ko.Computed;
}

interface IMenuTypeViewModel extends IMenuType {
    items: ko.ObservableArray<IMenuItemViewModel>,
    selectedType: ko.Observable<boolean>;
    onclick(): void;
}

interface IMenuItemViewModel extends IMenuItem {
    addItemToCart(): void;
}

const DATA: IMenu = {
    "items": [
        {
            "id": 0,
            "name": "Hamburger",
            "type_id": 0,
            "price": 425,
            "options":[22, 23, 24, 25]
        },
        {
            "id": 1,
            "name": "Cheeseburger",
            "type_id": 0,
            "price":470,
            "options":[22, 23, 24, 25]
        },
        {
            "id":2,
            "name": "Double Cheeseburger",
            "type_id": 0,
            "price": 655,
            "options":[22, 23, 24, 25]
        },
        {
            "id":3,
            "name": "Double Hamburger",
            "type_id": 0,
            "price": 305,
            "options":[22, 23, 24, 25]
        
        },
        {
            "id":4,
            "name": "Roast Beef",
            "type_id": 1,
            "price": 880
        },
        {
            "id":5,
            "name": "Spaghetti",
            "type_id": 1,
            "price": 880
        },
        {
            "id": 6,
            "name": "Pot Roast",
            "type_id": 1,
            "price": 750
        },
        {
            "id": 7,
            "name": "BBQ Pork",
            "type_id": 1,
            "price": 775
        },
        {
            "id": 8,
            "name": "Blueberry Pie",
            "type_id": 3,
            "price": 320
        },
        {
            "id": 9,
            "name": "Apple Cobbler Pie",
            "type_id":3,
            "price": 220
        },
        {
            "id":10,
            "name": "Salad",
            "type_id":2,
            "price": 305
        },
        {
            "id":11,
            "name": "French Fries",
            "type_id": 2,
            "price": 220
        },
        {
            "id":12,
            "name": "Garlic Bread",
            "type_id": 2,
            "price": 175
        },
        {
            "id":13,
            "name": "Peas",
            "type_id":2,
            "price": 175
        },
        {
            "id":14,
            "name": "Bottled Water",
            "type_id": 4,
            "price": 220
        },
        {
            "id":15,
            "name": "Gatorade",
            "type_id":4,
            "price":220
        },
        {
            "id":16,
            "name":"Tea",
            "type_id":5,
            "price":220,
            "options": [26, 27, 28]
        },
        {
            "id":17,
            "name": "Sweet Tea",
            "type_id": 5,
            "price": 220,
            "options": [26, 27, 28]
        },
        {
            "id": 18,
            "name": "Coffee",
            "type_id": 5,
            "price": 100,
            "options": [26, 27, 28]
        },
        {
            "id": 19,
            "name": "Chips",
            "type_id": 6,
            "price":75
        },
        {
            "id":20,
            "name":"Candy Bar",
            "type_id":6,
            "price":150
        },
        {
           "id":21,
           "name":"Peanuts",
           "type_id":6,
           "price":100
        },
        {
            "id":22,
            "name": "Lettuce",
            "type_id":7,
            "price": 0
        },
        {
            "id":23,
            "name": "Pickles",
            "type_id":7,
            "price":0
        },
        {
            "id":24,
            "name": "Onions",
            "type_id":7,
            "price":0
        },
        {
            "id":25,
            "name": "Tomatoes",
            "type_id":7,
            "price":0
        },
        {
            "id":26,
            "name": "Small Cup",
            "type_id": 7,
            "price": 0
        },
        {
            "id":27,
            "name": "Medium Cup",
            "type_id": 7,
            "price":75
        },
        {
            "id":28,
            "name": "Large Cup",
            "type_id": 7,
            "price": 100
        }
    ],
    "types": [
        {
            "id": 0,
            "name": "Sandwich"
        },
        {
            "id": 1,
            "name": "Dinner"
        },
        {
            "id": 2,
            "name": "Side"
        },
        {
            "id": 3,
            "name": "Dessert"
        },
        {
            "id": 4,
            "name": "Drinks"
        },
        {
            "id": 5,
            "name": "Fountain Drinks"
        },
        {
            "id": 6,
            "name": "Snacks"
        },
        {
            "id": 7,
            "name": "Condiments"
        }
    ]
}


function ModalOptionViewModel(this: IModalOptionViewModel, id: number, name:string) {
    let self = this;
    self.id = id;
    self.name = name;
    self.selected = ko.observable(false);
}

function ModalViewModel(this:IModalViewModel) {
    let self = this;
    self.showModal = ko.observable(false);
    self.modalOptions = ko.observableArray<IModalOptionViewModel>([]);
    self.onComplete = ko.observable<CallableFunction>(() => {});
    self.onCancel = () => self.showModal(false);

    self.setModal = (val) => { self.showModal(val); return self; }
    self.setOptions = (options) => {
        self.modalOptions(options.map((id) => new ModalOptionViewModel(DATA.items[id].id, DATA.items[id].name)));
        return self;
    }
    self.setOnDone = (onDone) => { self.onComplete(onDone); return self; }
}

function RootViewModel(this:IRootViewModel)
{
    let self = this;

    self.modalModel = ko.observable<IModalViewModel>(new ModalViewModel());
    self.shoppingCart = ko.observableArray<IShoppingCartItemModel>([]);
    
    // Not using a map statement because we need the reference
    let types: IMenuTypeViewModel[] = [];
    for (let type of DATA.types) {
        types.push(new MenuTypeViewModel(type, types, self.shoppingCart, self.modalModel));
    }
    self.types = ko.observableArray(types);
    self.total = () => (self.shoppingCart().length > 0) ? self.shoppingCart()
        .map(item => item.price())
        .reduce((a, b) => a + b) : 0;
   
    self.totalSurcharge = () => {
        return "$ " + (self.total()/100).toFixed(2);
    }
}

function ShoppingCartItemModel(this: IShoppingCartItemModel, item: IMenuItem, ondelete: CallableFunction, options: number[])
{
    let self = this;

    self.name = item.name;
    self.options = options;
    self.quantity = 1;
    self.ondelete = ondelete;
    self.onedit = null;

    self.price = ko.computed(() => {
        return (!options.length) ? item.price : item.price + options
            .map((id:number) => DATA.items[id].price)
            .reduce((a:number, b:number) => a + b)
    })
    self.displayName = ko.computed(() => {
        return self.name + options.map((id:number) => "<br/>+ " + DATA.items[id].name).join("")
    })

    self.displayPrice = ko.computed(() => {
        return "$ " + (self.price() / 100).toFixed(2)
    })
}

function MenuTypeViewModel(
    this: IMenuTypeViewModel, 
    type: IMenuType, 
    allTypeModels: IMenuTypeViewModel[], 
    shoppingCart: ko.ObservableArray<IShoppingCartItemModel>, 
    modalModel: ko.Observable<IModalViewModel>,
)
{
    let self = this;
    
    let items = DATA.items
        .filter((item) => item.type_id == type.id)
        .map((item) => new MenuItemViewModel(item, shoppingCart, modalModel))
    self.name = type.name
    self.items = ko.observableArray(items)
    self.selectedType = ko.observable(false);
    self.onclick = () => {
        allTypeModels.forEach(item => item.selectedType(false))
        self.selectedType(true);
    }
}


function MenuItemViewModel(
    this:IMenuItemViewModel, 
    item: IMenuItem, 
    shoppingCart: ko.ObservableArray<IShoppingCartItemModel>, 
    modalModel: ko.Observable<IModalViewModel>,
) {
    let self = this
    self.id = item.id
    self.name = item.name
    self.price = item.price
    self.options = item.options ? item.options : []
    self.addItemToCart = () => 
    {
        let ondelete = (item:IShoppingCartItemModel) => shoppingCart.remove(item);
        if (! (item.options && item.options.length)) {
            shoppingCart.push(new ShoppingCartItemModel(self, ondelete, []));
        }
        else {
            let modal = modalModel();
            modal
                .setOptions(item.options)
                .setOnDone(function () 
                {
                    let selected = modal.modalOptions()
                        .map((optionModel) => optionModel.selected() ? optionModel.id : -1)
                        .filter((id) => id >= 0)            
                    shoppingCart.push(new ShoppingCartItemModel(self, ondelete, selected))
                    modal.setModal(false);
                })
                .setModal(true)
        }
    }
}

ko.applyBindings(new RootViewModel());