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


// A view model representing an option within a modal dialog box.
function ModalOptionViewModel(this: IModalOptionViewModel, id: number, name:string) {
    let self = this;
    self.id = id; // unique identifier for the option
    self.name = name; // display name for the option
    self.selected = ko.observable(false); // boolean flag to track if this option is selected, default is false
}

// A view model for a modal dialog box.
function ModalViewModel(this:IModalViewModel) {
    let self = this;
    self.showModal = ko.observable(false); // a boolean flag indicating whether the modal should be displayed
    self.modalOptions = ko.observableArray<IModalOptionViewModel>([]); // a list of options for the modal
    self.onComplete = ko.observable<CallableFunction>(() => {}); // a callback function to be called when the modal dialog is completed
    self.onCancel = () => self.showModal(false); // a function to be called when the modal dialog is canceled

    // a function to set the visibility of the modal
    self.setModal = (val) => { self.showModal(val); return self; }

    // a function to set the options of the modal, transforming input data to ModalOptionViewModel objects
    self.setOptions = (options) => {
        self.modalOptions(options.map((id) => new ModalOptionViewModel(getData().items[id].id, getData().items[id].name)));
        return self;
    }

    // a function to set the onComplete callback function
    self.setOnDone = (onDone) => { self.onComplete(onDone); return self; }
}


function RootViewModel(this:IRootViewModel)
{
    let self = this;

    // Init model for modal
    self.modalModel = ko.observable<IModalViewModel>(new ModalViewModel());

    // Init shoppingCart
    self.shoppingCart = ko.observableArray<IShoppingCartItemModel>([]);
    
    // Not using a map statement because we need the reference
    let types: IMenuTypeViewModel[] = [];
    for (let type of getData().types) {
        types.push(new MenuTypeViewModel(type, types, self.shoppingCart, self.modalModel));
    }
    
    // Types is the model representing the "pages" of items when you click on "Categories"
    self.types = ko.observableArray(types);

    // A function to compute the total
    self.total = () => (self.shoppingCart().length > 0) ? self.shoppingCart()
        .map(item => item.price())
        .reduce((a, b) => a + b) : 0;
   
    // Format the total as string
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

    // Compute the price by summing the item price + price of selected options
    self.price = ko.computed(() => {
        return (!options.length) ? item.price : item.price + options
            .map((id:number) => getData().items[id].price)
            .reduce((a:number, b:number) => a + b)
    })

    // Display any selected optios with the item
    self.displayName = ko.computed(() => {
        return self.name + options.map((id:number) => "<br/>+ " + getData().items[id].name).join("")
    })
    
    // Price as a string
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
    
    // Convert the Menu Data into knockout view model
    let items = getData().items
        .filter((item) => item.type_id == type.id)
        .map((item) => new MenuItemViewModel(item, shoppingCart, modalModel))
    self.name = type.name

    // These items only belong to items of this type
    self.items = ko.observableArray(items)
    
    // Show the panel of these items when button is clicked
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

    // Called when item is added
    self.addItemToCart = () => 
    {
        let ondelete = (item:IShoppingCartItemModel) => shoppingCart.remove(item);

        // Check if the item has available options. If it doesn't, don't show modal 
        if (! (item.options && item.options.length)) {
            shoppingCart.push(new ShoppingCartItemModel(self, ondelete, []));
        }
        else {
            // It has options that users can select. Bring up the option modal
            let modal = modalModel();
            modal
                .setOptions(item.options)   // Query the available options for this item
                .setOnDone(function ()      // Set the done function to add this item to cart
                {
                    let selected = modal.modalOptions()
                        .map((optionModel) => optionModel.selected() ? optionModel.id : -1)
                        .filter((id) => id >= 0)            
                    shoppingCart.push(new ShoppingCartItemModel(self, ondelete, selected))
                    modal.setModal(false);
                })
                .setModal(true)             // Show the modal
        }
    }
}

// Hidden data. Do not access directly
let _data: IMenu | null = null;

// This shouldn't throw because _data is set by a promise
function getData(): IMenu {
    if (! _data) {
        throw "Error"
    }
    return _data;
}

const MENU_API_HOST = "http://localhost:5080"

async function _getData(): Promise<IMenu> {
    let menuItem = MENU_API_HOST + "/menuitems"
    let menuType = MENU_API_HOST + "/menutypes"

    let resp = await fetch(menuItem)
    let resp2 = await fetch(menuType)

    return {
        items: await resp.json(),
        types: await resp2.json(),
    }
}

_getData()
    .then((data:IMenu) => _data = data) // Set the private value
    .then((_) => ko.applyBindings(new RootViewModel())); // Init the view model after successful request

