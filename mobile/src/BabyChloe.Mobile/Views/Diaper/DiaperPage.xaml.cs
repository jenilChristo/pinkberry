using BabyChloe.Mobile.ViewModels.Diaper;

namespace BabyChloe.Mobile.Views.Diaper;

public partial class DiaperPage : ContentPage
{
    public DiaperPage(DiaperViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}