using BabyChloe.Mobile.ViewModels.Feeding;

namespace BabyChloe.Mobile.Views.Feeding;

public partial class FeedingPage : ContentPage
{
    public FeedingPage(FeedingViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}