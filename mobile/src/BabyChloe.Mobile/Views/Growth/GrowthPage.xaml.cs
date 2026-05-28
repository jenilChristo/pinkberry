using BabyChloe.Mobile.ViewModels.Growth;

namespace BabyChloe.Mobile.Views.Growth;

public partial class GrowthPage : ContentPage
{
    public GrowthPage(GrowthViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}