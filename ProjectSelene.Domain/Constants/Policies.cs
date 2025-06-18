namespace ProjectSelene.Domain.Constants;

public abstract class Policies
{
    public const string NOBODY = nameof(NOBODY);

    public const string CAN_SEE_ALL_MODS = nameof(CAN_SEE_ALL_MODS);
    public const string CAN_UPLOAD_FOR_OTHERS = nameof(CAN_UPLOAD_FOR_OTHERS);
    public const string CAN_PURGE = nameof(CAN_PURGE);
    public const string CAN_VERIFY = nameof(CAN_VERIFY);
}
