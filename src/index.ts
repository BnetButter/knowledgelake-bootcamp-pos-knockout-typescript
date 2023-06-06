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
        self.modalOptions(options.map((id) => new ModalOptionViewModel(getData().items[id].id, getData().items[id].name)));
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
    for (let type of getData().types) {
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
            .map((id:number) => getData().items[id].price)
            .reduce((a:number, b:number) => a + b)
    })
    self.displayName = ko.computed(() => {
        return self.name + options.map((id:number) => "<br/>+ " + getData().items[id].name).join("")
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
    
    let items = getData().items
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

let _data: IMenu | null = null;

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
    .then((data:IMenu) => _data = data)
    .then((_) => ko.applyBindings(new RootViewModel()));

