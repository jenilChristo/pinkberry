using BabyChloe.Mobile.ViewModels.Sleep;

namespace BabyChloe.Mobile.Views.Sleep;

public partial class SleepPage : ContentPage
{
    public SleepPage(SleepViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}